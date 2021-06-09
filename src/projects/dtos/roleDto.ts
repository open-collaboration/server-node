import {
    Allow, ArrayMaxSize, ArrayMinSize, IsEmpty, IsNotEmpty, Length,
} from 'class-validator'
import { PROJECT_DTO_GROUP_CREATE, PROJECT_DTO_GROUP_UPDATE } from './dtoGroups'

export default class RoleDto {
    @Allow()
    @IsEmpty({
        groups: [PROJECT_DTO_GROUP_CREATE],
    })
    @IsNotEmpty({
        groups: [PROJECT_DTO_GROUP_UPDATE],
    })
    id?: string

    @Length(3, 40)
    title = ''

    @Length(20, 300)
    description = ''

    @ArrayMinSize(1)
    @ArrayMaxSize(5)
    skills: string[] = []
}
