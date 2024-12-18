from scipy import stats
import numpy as np

import matplotlib.pyplot as plt

num_tries = 1

num_dots = 1000

# real_slope = 1
# err_mean = 0
# err_std = 0.1

# for i in range(num_tries):
#     x = np.linspace(0, 1, num_dots)
#     y = real_slope * x + np.random.normal(err_mean, err_std, num_dots)

#     slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)

#     print(slope, intercept, r_value ** 2, p_value, std_err)
#     plt.plot(x, y, 'o')
#     plt.plot(x, slope * x + intercept, 'r')
#     plt.savefig('r2graph.png')

# PrefR2 = np.sqrt(0.5)

# x = np.linspace(0, 1, num_dots)
# z = np.random.normal(0, 1, num_dots)

# x_standardized = (x - np.mean(x)) / np.std(x)
# z_standardized = (z - np.mean(z)) / np.std(z)

# y = PrefR2 * x_standardized + np.sqrt(1 - PrefR2*PrefR2) * z_standardized

# slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
# print(slope, intercept, r_value ** 2, p_value, std_err)

# plt.plot(x, y, 'o')
# plt.savefig('r2graph.png')


def generate_step_function_points(n, r2, low=0, high=1, error_std=0.1):
    # r2 = np.sqrt(r2)
    # Generate uniform x
    x = np.linspace(low, high, n)

    step_at = r2 * high + (1 - r2) * low
    before_step = low
    after_step = high

    error = np.random.normal(0, error_std, n)

    y = np.array(
        [before_step if xi < step_at else after_step for xi in x]) + error

    # Verify R2
    slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
    calculated_r2 = r_value**2

    return x, y, calculated_r2


x = np.linspace(0.5, 1, 500)
y = np.array([generate_step_function_points(
    n=num_dots, r2=r2, error_std=0)[2] for r2 in x])

ymax = np.max(y)
plt.plot(y, x)

print(list([f"{y:.5f}" for x, y in zip(x, y)]))

plt.savefig('r2generator_output/r2graph2.png')

# x, y, calculated_r2 = generate_step_function_points(
#     n=num_dots, r2=0, error_std=0)

# print(calculated_r2)

# plt.plot(x, y, 'o')
# plt.savefig('r2graph.png')
