import bcrypt from 'bcrypt'
import Model from '../../share/model'

export default class User extends Model {
    username = ''

    email = ''

    password = ''

    async comparePassword(pwd: string): Promise<boolean> {
        return bcrypt.compare(pwd, this.password)
    }

    async setPassword(password: string): Promise<void> {
        this.password = await bcrypt.hash(password, 10)
    }
}
