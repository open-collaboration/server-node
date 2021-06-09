import Project from '../models/project'

export default class ProjectSummaryDto {
    id?: string

    title = ''

    shortDescription = ''

    tags: string[] = []

    skills: string[] = []

    static fromProject(project: Project): ProjectSummaryDto {
        const dto = new ProjectSummaryDto()

        dto.id = project.id
        dto.title = project.title
        dto.shortDescription = project.shortDescription

        return dto
    }
}
