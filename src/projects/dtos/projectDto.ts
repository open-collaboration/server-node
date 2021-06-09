import { Type } from 'class-transformer'
import {
    Allow, ArrayMaxSize, ArrayMinSize, IsArray, IsEmpty, IsNotEmpty, Length, ValidateNested,
} from 'class-validator'
import Project from '../models/project'
import { PROJECT_DTO_GROUP_CREATE, PROJECT_DTO_GROUP_UPDATE } from './dtoGroups'
import RoleDto from './roleDto'

export default class ProjectDto {
    @Allow()
    @IsEmpty({
        groups: [PROJECT_DTO_GROUP_CREATE],
    })
    @IsNotEmpty({
        groups: [PROJECT_DTO_GROUP_UPDATE],
    })
    id?: string

    @Length(4, 30)
    title = ''

    @Length(20, 200)
    shortDescription = ''

    @Length(300, 10000)
    longDescription = ''

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(5)
    @ValidateNested({
        each: true,
    })
    @Type(() => RoleDto)
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
