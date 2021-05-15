import { getModelForClass, prop } from '@typegoose/typegoose'

export class Project {
    @prop()
    _id?: string;

    @prop({ type: String})
    title = '';

    @prop({ type: String})
    shortDescription = '';

    @prop({ type: String})
    longDescription = '';
}

export const ProjectModel = getModelForClass(Project)