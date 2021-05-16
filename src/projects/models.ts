import { getModelForClass, prop } from '@typegoose/typegoose'
import { Base } from '@typegoose/typegoose/lib/defaultClasses'

export class Project extends Base {

    @prop({ type: String})
    title = '';

    @prop({ type: String})
    shortDescription = '';

    @prop({ type: String})
    longDescription = '';
}

export const ProjectModel = getModelForClass(Project)