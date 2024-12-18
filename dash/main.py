import dash
from dash import dcc, html, Input, Output, ClientsideFunction
import dash_bootstrap_components as dbc
import plotly.graph_objs as go
import numpy as np
from scipy import stats

# Initialize the Dash app
app = dash.Dash(__name__)

# Layout of the app
app.layout = html.Div([
    html.H1("Demonstration of linear regression and datasets with different R2 values"),
    dbc.Button("New datasets", id='new-dataset-button',
               color='primary', className='mt-2'),
    html.Div([
        html.Div([
            dcc.Slider(
                id='normal-error-r2-slider',
                className='slider',
                min=0, max=1, step=0.01, value=1,
                marks=None,
                vertical=True,
                updatemode='drag',
                included=True,
                tooltip={'always_visible': True, 'placement': 'right'},
            ),
            dcc.Graph(id='normal-error-graph'),
            html.Div([
                html.Div(id='normal-error-stats-container',
                         className='flex flex-col stats-container'),
            ], className='flex flex-col'),
        ], style={'display': 'flex'}),
        html.Div(["""The previous graph contains 'proper' dataset with normal distributed error. 
                  The following graphs are for fun, since I believe scientists wouldn't use this 
                  type of linear regression/statistical test on those types of data. """], style={'margin-top': '10px', 'margin-bottom': '10px', 'width': '35%', 'color': '#f00'}),
        html.Div(["Note on the following graph, that the R2 value is always less than ~0.75"], style={'margin-top': '10px',
                 'margin-bottom': '10px', 'width': '35%'}),
        html.Div([
            dcc.Slider(
                id='step-r2-slider',
                className='slider',
                min=0, max=1, step=0.01, value=1,
                marks=None,
                vertical=True,
                updatemode='drag',
                included=True,
                tooltip={'always_visible': True, 'placement': 'right'}
            ),
            dcc.Graph(id='step-graph'),
            html.Div([
                html.Div(id='step-stats-container',
                         className='flex flex-col stats-container'),
            ], className='flex flex-col'),
        ], style={'display': 'flex'}),
    ]),
])

app.clientside_callback(
    ClientsideFunction(
        namespace='clientside',
        function_name='update_normal_error_graph'
    ),
    [Output('normal-error-graph', 'figure'),
     Output('normal-error-stats-container', 'children')],
    [Input('normal-error-r2-slider', 'value'),
     Input('new-dataset-button', 'n_clicks')],
)

app.clientside_callback(
    ClientsideFunction(
        namespace='clientside',
        function_name='update_step_graph'
    ),
    [Output('step-graph', 'figure'), Output('step-stats-container', 'children')],
    [Input('step-r2-slider', 'value'), Input('new-dataset-button', 'n_clicks')],
)

# Run the app
if __name__ == '__main__':
    app.run_server(debug=True)
