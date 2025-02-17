# Locations to dispense each color of bacteria
# TODO: Replace these with your design
red_points = []
green_points = []
blue_points = []
orange_points = []

# List of the color names 
color_names = ["Red", "Green", "Blue", "Orange"]

# Handle one color bacteria at a time
for i, point_list in enumerate([red_points, green_points, blue_points, orange_points]):
    # Skip the rest of the loop if the list is empty
    if not point_list:
        continue

    # Get the tip for this run, set the bacteria color, and aspirate the required amount of bacteria
    pipette_20ul.pick_up_tip()
    current_color = color_names[i]
    pipette_20ul.aspirate(min(len(point_list)*4, 20), location_of_color(current_color))

    # Iterate over the current points list and dispense them, refilling along the way
    for i in range(len(point_list)):
        x, y = point_list[i]
        adjusted_location = center_location.move(types.Point(x, y))
        dispense_and_jog(pipette_20ul, 4, adjusted_location)
        # If the pipette runs out, and there are more points, refill it by the necessary amount 
        if pipette_20ul.current_volume < 4 and len(point_list[i+1:]) > 0:
            pipette_20ul.aspirate(min(len(point_list[i+1:])*4, 20), location_of_color(current_color))

    # Drop tip between each color to avoid cross contamination
    pipette_20ul.drop_tip()