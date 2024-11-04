export interface Room {
    roomId: string;
    attemptStartedAt: string;
    userIdOne: { _id: string };
    userIdTwo: { _id: string };
    questionId: string;
}
