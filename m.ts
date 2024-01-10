import { ITask } from "./lib/itask.ts"

export const x = {
    "headers": {
        "Content-Type": "application/json"
    },
    "body": {
        "dataSource": "Cluster0",
        "database": "test",
        "collection": "test",
        "documents": [
            {
                "type": "L",
                "word": "fuck",
                "last": 1,
                "next": 2,
                "level": 3
            },
            {
                "type": "R",
                "word": "fuck",
                "last": 3,
                "next": 2,
                "level": 1
            }
        ]
    }
}