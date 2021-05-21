import bcrypt from 'bcrypt'

export default class User {
    id?: string

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
