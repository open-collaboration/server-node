import { Allow, Length } from 'class-validator'
import { Project } from './models'

export class ProjectDto {

    @Allow()
    id?: string;

    @Length(4, 30)
    title = '';

    @Length(20, 200)
    shortDescription = '';

    @Length(300, 10000)
    longDescription = '';
   
    static fromProject(model: Project): ProjectDto {
        const out = new ProjectDto()

        out.id = model._id
        out.title = model.title
        out.shortDescription = model.shortDescription
        out.longDescription = model.longDescription

        return out
    }
}