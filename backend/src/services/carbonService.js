export const calculateCarbonEmission = (
    utilityType,
    usage,
    unit
) => {

    if (!utilityType || usage == null || !unit) {
        return 0;
    }

    const type = utilityType.toLowerCase();
    const measurement = unit.toLowerCase();

    let factor = 0;

    switch (type) {

        case "electricity":

            if (measurement === "kwh") {
                factor = 0.716;
            }

            break;

        case "water":

            if (measurement === "gallons") {
                factor = 0.0013;
            }

            break;

        case "gas":

            if (measurement === "therms") {
                factor = 5.3;
            }

            break;

        default:

            factor = 0;

    }

    return Number((usage * factor).toFixed(2));

};