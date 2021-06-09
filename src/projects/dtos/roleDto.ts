import {Allow, IsNotEmpty, Length} from "class-validator"

export default class RoleDto {
    @Allow()
    id?: string

    @Length(3, 40)
    title = ''

    @Length(20, 300)
    description = ''

    @Length(1, 5)
    skills: string[] = []
}
