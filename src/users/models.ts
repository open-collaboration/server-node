import { getModelForClass, prop } from '@typegoose/typegoose'
import bcrypt from 'bcrypt'
import { Base } from '@typegoose/typegoose/lib/defaultClasses'

export class User extends Base {

    @prop({ type: String, unique: true })
    username = ''

    @prop({ type: String, unique: true })
    email = '';

    @prop({ type: String })
    password = ''

    async comparePassword(pwd: string): Promise<boolean> {
        return bcrypt.compare(pwd, this.password) 
    }

    async setPassword(password: string): Promise<void> {
        this.password = await bcrypt.hash(password, 10)
    }

}

export const UserModel = getModelForClass(User)