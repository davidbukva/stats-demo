function computationExceeded() {
  return [
    {
      data: [],
      layout: {
        title: "Line Graph",
        xaxis: { title: "x" },
        yaxis: { title: "y" },
      },
    },
    "Computation limit exceeded, no dataset found with matching R2",
  ];
}

function linregression(x, y) {
  function wald_test(slope, std_err) {
    const z_score = slope / std_err;
    const p_value = 2 * (1 - window.jStat.normal.cdf(Math.abs(z_score), 0, 1)); // Two-tailed test
    console.log("z_score: ", z_score, "p_value: ", p_value);
    return p_value;
  }

  // Calculate slope, intercept, and r_value (using simple linear regression)
  const mean_x = x.reduce((a, b) => a + b, 0) / x.length;
  const mean_y = y.reduce((a, b) => a + b, 0) / y.length;

  const xy = x.map((xi, i) => (xi - mean_x) * (y[i] - mean_y));
  const xx = x.map((xi) => (xi - mean_x) ** 2);

  slope = xy.reduce((a, b) => a + b, 0) / xx.reduce((a, b) => a + b, 0);
  intercept = mean_y - slope * mean_x;

  const y_predicted = x.map((xi) => slope * xi + intercept);
  const ss_tot = y.map((yi) => (yi - mean_y) ** 2).reduce((a, b) => a + b, 0);
  const ss_res = y
    .map((yi, i) => (yi - y_predicted[i]) ** 2)
    .reduce((a, b) => a + b, 0);

  r_value = Math.sqrt(1 - ss_res / ss_tot); // r_value equivalent

  // Estimate standard error of the slope
  const n = x.length;
  const std_err =
    Math.sqrt(ss_res / (n - 2)) / Math.sqrt(xx.reduce((a, b) => a + b, 0));

  // Compute p-value using the Wald test
  p_value = wald_test(slope, std_err);
  return [slope, intercept, r_value, p_value];
}
function buildStatsText(r_value, p_value, slope) {
  const r2_element = {
    namespace: "dash_html_components",
    type: "Div",
    props: {
      children: `R2 value of current graph: ${(r_value ** 2).toFixed(2)}`,
    },
  };
  const p_value_element = {
    namespace: "dash_html_components",
    type: "Div",
    props: {
      children: `p-value: ${p_value.toFixed(3)} ${
        p_value < 0.05
          ? "(significant=> reject H0, assume some correlation)"
          : "(not significant=> fail to reject H0, anything could be true)"
      }`,
    },
  };
  const slope_element = {
    namespace: "dash_html_components",
    type: "Div",
    props: {
      children: `Slope: ${slope.toFixed(2)}`,
    },
  };
  return [r2_element, p_value_element, slope_element];
}

const NUM_DOTS = 100; // Example number of dots
const EPSILON = 0.01; // Example epsilon value
const NUM_TRIES = 1000; // Example maximum number of tries

window.dash_clientside = Object.assign({}, window.dash_clientside, {
  clientside: {
    update_normal_error_graph: function (preferred_r2, _n_clicks) {
      preferred_r2 = Math.sqrt(preferred_r2);

      function standardize(arr) {
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        const stdDev = Math.sqrt(
          arr.map((x) => (x - mean) ** 2).reduce((a, b) => a + b, 0) /
            arr.length
        );
        return [arr.map((x) => (x - mean) / stdDev), [mean, stdDev]];
      }

      function unstandardize(arr, params) {
        return arr.map((x) => x * params[1] + params[0]);
      }

      let x = Array.from({ length: NUM_DOTS }, (_, i) => i / (NUM_DOTS - 1)); // Generate x from 0 to 1
      let r_value = 10000;
      let num_tries = 0;
      let y, slope, intercept, p_value;

      while (
        r_value ** 2 < preferred_r2 ** 2 - EPSILON ||
        r_value ** 2 > preferred_r2 ** 2 + EPSILON
      ) {
        const z = Array.from({ length: NUM_DOTS }, () =>
          window.jStat.normal.sample(0, 1)
        ); // Generate random z

        const [x_standardized, standardization_params] = standardize(x);
        const [z_standardized, _] = standardize(z);

        let y_standardized = x_standardized.map(
          (xi, i) =>
            preferred_r2 * xi +
            Math.sqrt(1 - preferred_r2 ** 2) * z_standardized[i]
        );

        y = unstandardize(y_standardized, standardization_params);

        [slope, intercept, r_value, p_value] = linregression(x, y);

        num_tries++;
        if (num_tries > NUM_TRIES) {
          return computationExceeded();
        }
      }

      // Build the figure using Plotly
      const fig = {
        data: [
          {
            x: x,
            y: y,
            mode: "markers",
            type: "scatter",
            name: "Data",
          },
          {
            x: x,
            y: x.map((xi) => slope * xi + intercept),
            mode: "lines",
            type: "scatter",
            name: "Regression Line",
          },
        ],
        layout: {
          title: "Normal Distributed error",
          xaxis: { title: "x", range: [0, 1] },
          yaxis: { title: "y", range: [-0.2, 1.2] },
        },
      };

      const stats_children = buildStatsText(r_value, p_value, slope);
      return [fig, stats_children];
    },
    update_step_graph: function (preferred_r2, _n_clicks) {
      const step_at_to_r2 = [
        0.75, 0.75, 0.74999, 0.74997, 0.74995, 0.74993, 0.74989, 0.74985,
        0.74981, 0.74976, 0.7497, 0.74964, 0.74957, 0.74949, 0.74941, 0.74933,
        0.74923, 0.74913, 0.74903, 0.74892, 0.7488, 0.74868, 0.74855, 0.74841,
        0.74827, 0.74813, 0.74797, 0.74781, 0.74765, 0.74748, 0.7473, 0.74712,
        0.74693, 0.74673, 0.74653, 0.74633, 0.74611, 0.74589, 0.74567, 0.74544,
        0.7452, 0.74496, 0.74471, 0.74445, 0.74419, 0.74393, 0.74365, 0.74337,
        0.74309, 0.7428, 0.7425, 0.7422, 0.74189, 0.74157, 0.74125, 0.74093,
        0.74059, 0.74025, 0.73991, 0.73956, 0.7392, 0.73884, 0.73847, 0.73809,
        0.73771, 0.73733, 0.73693, 0.73653, 0.73613, 0.73572, 0.7353, 0.73488,
        0.73445, 0.73401, 0.73357, 0.73313, 0.73267, 0.73221, 0.73175, 0.73128,
        0.7308, 0.73032, 0.72983, 0.72933, 0.72883, 0.72833, 0.72781, 0.72729,
        0.72677, 0.72624, 0.7257, 0.72516, 0.72461, 0.72405, 0.72349, 0.72293,
        0.72235, 0.72177, 0.72119, 0.7206, 0.72, 0.7194, 0.71879, 0.71817,
        0.71755, 0.71693, 0.71629, 0.71565, 0.71501, 0.71436, 0.7137, 0.71304,
        0.71237, 0.71169, 0.71101, 0.71033, 0.70963, 0.70893, 0.70823, 0.70752,
        0.7068, 0.70608, 0.70535, 0.70461, 0.70387, 0.70313, 0.70237, 0.70161,
        0.70085, 0.70008, 0.6993, 0.69852, 0.69773, 0.69693, 0.69613, 0.69533,
        0.69451, 0.69369, 0.69287, 0.69204, 0.6912, 0.69036, 0.68951, 0.68865,
        0.68779, 0.68693, 0.68605, 0.68517, 0.68429, 0.6834, 0.6825, 0.6816,
        0.68069, 0.67977, 0.67885, 0.67793, 0.67699, 0.67605, 0.67511, 0.67416,
        0.6732, 0.67224, 0.67127, 0.67029, 0.66931, 0.66833, 0.66733, 0.66633,
        0.66533, 0.66432, 0.6633, 0.66228, 0.66125, 0.66021, 0.65917, 0.65813,
        0.65707, 0.65601, 0.65495, 0.65388, 0.6528, 0.65172, 0.65063, 0.64953,
        0.64843, 0.64733, 0.64621, 0.64509, 0.64397, 0.64284, 0.6417, 0.64056,
        0.63941, 0.63825, 0.63709, 0.63593, 0.63475, 0.63357, 0.63239, 0.6312,
        0.63, 0.6288, 0.62759, 0.62637, 0.62515, 0.62393, 0.62269, 0.62145,
        0.62021, 0.61896, 0.6177, 0.61644, 0.61517, 0.61389, 0.61261, 0.61133,
        0.61003, 0.60873, 0.60743, 0.60612, 0.6048, 0.60348, 0.60215, 0.60081,
        0.59947, 0.59813, 0.59677, 0.59541, 0.59405, 0.59268, 0.5913, 0.58992,
        0.58853, 0.58713, 0.58573, 0.58433, 0.58291, 0.58149, 0.58007, 0.57864,
        0.5772, 0.57576, 0.57431, 0.57285, 0.57139, 0.56993, 0.56845, 0.56697,
        0.56549, 0.564, 0.5625, 0.561, 0.55949, 0.55797, 0.55645, 0.55493,
        0.55339, 0.55185, 0.55031, 0.54876, 0.5472, 0.54564, 0.54407, 0.54249,
        0.54091, 0.53933, 0.53773, 0.53613, 0.53453, 0.53292, 0.5313, 0.52968,
        0.52805, 0.52641, 0.52477, 0.52313, 0.52147, 0.51981, 0.51815, 0.51648,
        0.5148, 0.51312, 0.51143, 0.50973, 0.50803, 0.50633, 0.50461, 0.50289,
        0.50117, 0.49944, 0.4977, 0.49596, 0.49421, 0.49245, 0.49069, 0.48893,
        0.48715, 0.48537, 0.48359, 0.4818, 0.48, 0.4782, 0.47639, 0.47457,
        0.47275, 0.47093, 0.46909, 0.46725, 0.46541, 0.46356, 0.4617, 0.45984,
        0.45797, 0.45609, 0.45421, 0.45233, 0.45043, 0.44853, 0.44663, 0.44472,
        0.4428, 0.44088, 0.43895, 0.43701, 0.43507, 0.43313, 0.43117, 0.42921,
        0.42725, 0.42528, 0.4233, 0.42132, 0.41933, 0.41733, 0.41533, 0.41333,
        0.41131, 0.40929, 0.40727, 0.40524, 0.4032, 0.40116, 0.39911, 0.39705,
        0.39499, 0.39293, 0.39085, 0.38877, 0.38669, 0.3846, 0.3825, 0.3804,
        0.37829, 0.37617, 0.37405, 0.37193, 0.36979, 0.36765, 0.36551, 0.36336,
        0.3612, 0.35904, 0.35687, 0.35469, 0.35251, 0.35033, 0.34813, 0.34593,
        0.34373, 0.34152, 0.3393, 0.33708, 0.33485, 0.33261, 0.33037, 0.32813,
        0.32587, 0.32361, 0.32135, 0.31908, 0.3168, 0.31452, 0.31223, 0.30993,
        0.30763, 0.30533, 0.30301, 0.30069, 0.29837, 0.29604, 0.2937, 0.29136,
        0.28901, 0.28665, 0.28429, 0.28193, 0.27955, 0.27717, 0.27479, 0.2724,
        0.27, 0.2676, 0.26519, 0.26277, 0.26035, 0.25793, 0.25549, 0.25305,
        0.25061, 0.24816, 0.2457, 0.24324, 0.24077, 0.23829, 0.23581, 0.23333,
        0.23083, 0.22833, 0.22583, 0.22332, 0.2208, 0.21828, 0.21575, 0.21321,
        0.21067, 0.20813, 0.20557, 0.20301, 0.20045, 0.19788, 0.1953, 0.19272,
        0.19013, 0.18753, 0.18493, 0.18233, 0.17971, 0.17709, 0.17447, 0.17184,
        0.1692, 0.16656, 0.16391, 0.16125, 0.15859, 0.15593, 0.15325, 0.15057,
        0.14789, 0.1452, 0.1425, 0.1398, 0.13709, 0.13437, 0.13165, 0.12893,
        0.12619, 0.12345, 0.12071, 0.11796, 0.1152, 0.11244, 0.10967, 0.10689,
        0.10411, 0.10133, 0.09853, 0.09573, 0.09293, 0.09012, 0.0873, 0.08448,
        0.08165, 0.07881, 0.07597, 0.07313, 0.07027, 0.06741, 0.06455, 0.06168,
        0.0588, 0.05592, 0.05303, 0.05013, 0.04723, 0.04433, 0.04141, 0.03849,
        0.03557, 0.03264, 0.0297, 0.02676, 0.02381, 0.02085, 0.01789, 0.01493,
        0.01195, 0.00897, 0.00599, 0.003,
      ];

      const index_in_map = step_at_to_r2.findIndex((r2) => r2 <= preferred_r2);

      const ratio =
        index_in_map == -1 ? 1 : index_in_map / (step_at_to_r2.length - 1);

      const min_step = 0.5;
      const max_step = 1;

      const step_at = min_step + (max_step - min_step) * ratio;

      let x = Array.from({ length: NUM_DOTS }, (_, i) => i / (NUM_DOTS - 1)); // Generate x from 0 to 1
      let error = Array.from({ length: NUM_DOTS }, () =>
        window.jStat.normal.sample(0, 0.01)
      ); // Generate random z

      let y = x.map((xi, i) => (xi <= step_at ? 0 : 1) + error[i]);

      const [slope, intercept, r_value, p_value] = linregression(x, y);

      // Build the figure using Plotly
      const fig = {
        data: [
          {
            x: x,
            y: y,
            mode: "markers",
            type: "scatter",
            name: "Data",
          },
          {
            x: x,
            y: x.map((xi) => slope * xi + intercept),
            mode: "lines",
            type: "scatter",
            name: "Regression Line",
          },
        ],
        layout: {
          title: "Step function (with tiny error for fun)",
          xaxis: { title: "x", range: [0, 1] },
          yaxis: { title: "y", range: [-0.2, 1.2] },
        },
      };

      const stats_children = buildStatsText(r_value, p_value, slope);
      return [fig, stats_children];
    },
  },
});
