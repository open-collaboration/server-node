export default class Model {
    private _id?: string

    get id(): string {
        if (this._id === undefined) {
            throw new Error('Project has no id')
        }

        return this._id
    }

    set id(newId: string) {
        this._id = newId
    }

    hasId(): boolean {
        return this._id !== undefined
    }
}
