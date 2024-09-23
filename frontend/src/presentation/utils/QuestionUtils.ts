export const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
        case "Easy":
            return "green";
        case "Medium":
            return "orange";
        case "Hard":
            return "red";
        default:
            return "gray";
    }
};

export const getStatusColor = (status: string): string => {
    switch (status) {
        case "complete":
            return "green";
        case "working":
            return "blue";
        case "starting":
            return "gold";
        default:
            return "gray";
    }
};