type Data = {
    numbloc: number,
    level: number,
    score: number,
    goal: string
}

export class Player {
    data: Data;
    status: string = '';
    surname: string = '';
}
