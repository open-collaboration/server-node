import Model from '../../share/model'

export default class Role extends Model {
    projectId = ''

    title = ''

    description = ''

    skills: string[] = []
}
