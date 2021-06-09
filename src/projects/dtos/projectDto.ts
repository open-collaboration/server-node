import { Type } from 'class-transformer'
import {
    Allow, ArrayMaxSize, ArrayMinSize, IsArray, Length, ValidateNested,
} from 'class-validator'
import Project from '../models/project'
import RoleDto from './roleDto'

export default class ProjectDto {
    @Allow()
    id?: string

    @Length(4, 30)
    title = ''

    @Length(20, 200)
    shortDescription = ''

    @Length(300, 10000)
    longDescription = ''

    @IsArray()
    @Type(() => RoleDto)
    @ArrayMinSize(1)
    @ArrayMaxSize(5)
    @ValidateNested()
    roles: RoleDto[] = []

    static fromProject(model: Project): ProjectDto {
        const out = new ProjectDto()

        out.id = model.id
        out.title = model.title
        out.shortDescription = model.shortDescription
        out.longDescription = model.longDescription

        return out
    }
}
