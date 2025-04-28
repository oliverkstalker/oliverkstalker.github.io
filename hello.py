from manim import *
import numpy as np

# Editable variables
X_RANGE_END_EDITABLE = 4 * PI
X_RANGE_STEP_EDITABLE = PI
Y_RANGE_LOW_EDITABLE = -1.5
Y_RANGE_HIGH_EDITABLE = 1.5
Y_RANGE_STEP_EDITABLE = 0.5
GRAPH_COLOR_EDITABLE = RED
AXIS_COLOR_EDITABLE = BLUE
DOT_COLOR_EDITABLE = YELLOW
ANIMATION_RUN_TIME_EDITABLE = 5

class DotOnSine(Scene):
    def construct(self):
        ax = Axes(
            x_range=[0, X_RANGE_END_EDITABLE, X_RANGE_STEP_EDITABLE],
            y_range=[Y_RANGE_LOW_EDITABLE, Y_RANGE_HIGH_EDITABLE, Y_RANGE_STEP_EDITABLE],
            axis_config={"color": AXIS_COLOR_EDITABLE}
        )

        graph = ax.plot(lambda x: np.sin(x), color=GRAPH_COLOR_EDITABLE)
        dot = Dot(color=DOT_COLOR_EDITABLE).move_to(ax.c2p(0, 0))

        def update_dot(mob, alpha):
            x = alpha * X_RANGE_END_EDITABLE
            y = np.sin(x)
            mob.move_to(ax.c2p(x, y))

        self.add(ax, graph, dot)
        self.play(UpdateFromAlphaFunc(dot, update_dot), run_time=ANIMATION_RUN_TIME_EDITABLE)
        self.wait(1)
