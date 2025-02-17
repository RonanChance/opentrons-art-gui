from opentrons import types

# TODO: Replace these with your information
metadata = {
    'protocolName': 'HTGAA Opentrons Lab',
    'author': 'HTGAA',
    'source': 'HTGAA 2025',
    'apiLevel': '2.20'
}

# Locations to dispense each color of bacteria
# TODO: Replace these with your design
blue_points = []
red_points = []
yellow_points = []
green_points = []
cyan_points = []

##############################################################################
###   Robot deck setup constants - don't change these                      ###
##############################################################################

TIP_RACK_DECK_SLOT = 9
COLORS_DECK_SLOT = 6
AGAR_DECK_SLOT = 5
PIPETTE_STARTING_TIP_WELL = 'A1'

well_colors = {
    'A1' : 'Red',
    'B1' : 'Yellow',
    'C1' : 'Green',
    'D1' : 'Cyan',
    'E1' : 'Blue'
}

def run(protocol):
    ##############################################################################
    ###   Load labware, modules and pipettes                                   ###
    ##############################################################################

    # Tips
    tips_20ul = protocol.load_labware('opentrons_96_tiprack_20ul', TIP_RACK_DECK_SLOT, 'Opentrons 20uL Tips')

    # Pipettes
    pipette_20ul = protocol.load_instrument("p20_single_gen2", "right", [tips_20ul])

    # Modules
    temperature_module = protocol.load_module('temperature module gen2', COLORS_DECK_SLOT)

    # Temperature Module Plate
    temperature_plate = temperature_module.load_labware('opentrons_96_aluminumblock_generic_pcr_strip_200ul', 'Cold Plate')
    
    # Choose where to take the colors from
    color_plate = temperature_plate

    # Agar Plate
    agar_plate = protocol.load_labware('htgaa_agar_plate', AGAR_DECK_SLOT, 'Agar Plate')  ## TA MUST CALIBRATE EACH PLATE!
    
    # Get the top-center of the plate, make sure the plate was calibrated before running this
    center_location = agar_plate['A1'].top()

    # Add offset
    agar_plate.set_offset(x=0.00, y=0.00, z=17.5) # 14.5 works best when testing empty dish with water & no agar

    pipette_20ul.starting_tip = tips_20ul.well(PIPETTE_STARTING_TIP_WELL)

    ##############################################################################
    ###   Patterning                                                           ###
    ##############################################################################

    ###
    ### Helper functions for this lab
    ###

    # pass this e.g. 'Red' and get back a Location which can be passed to aspirate()
    def location_of_color(color_string):
        for well,color in well_colors.items():
            if color.lower() == color_string.lower():
                return color_plate[well]
        raise ValueError(f"No well found with color {color_string}")

    # For this lab, instead of calling pipette.dispense(1, loc) use this: dispense_and_jog(pipette, 1, loc)
    def dispense_and_jog(pipette, volume, location):
        """
        Dispense and then move up 5mm and back down to shake all dispensed fluid off the tip;
        this also ensures it's not moving laterally before the dispense is done.
        """
        assert(isinstance(volume, (int, float)))
        pipette.dispense(volume, location)
        currLoc = pipette._get_last_location_by_api_version()
        pipette.move_to(currLoc.move(types.Point(z=5)))
        # pipette.move_to(currLoc) # I recommend removing this line

    cursor = center_location.move(types.Point(x=-35.5, y = 12))


    # List of the color names 
    color_names = ["Blue", "Red", "Yellow", "Green", "Cyan"]

    # Handle one color bacteria at a time
    for i, point_list in enumerate([blue_points, red_points, yellow_points, green_points, cyan_points]):
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