import { IsEmail, Length } from 'class-validator'

export default class RegisterUserDto {
    @Length(4, 30)
    username = ''

    @IsEmail()
    email = ''

    @Length(6)
    password = ''
}
