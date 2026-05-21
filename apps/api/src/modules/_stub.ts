// NestJS Module stub — 14 modules, skeletons for Sprint 0

export function createModuleStub(moduleName: string): string {
  return `
// ${moduleName} Module — Sprint 0 skeleton
// Full implementation in Sprint 1+

export class ${moduleName}Service {
  async findAll(query: any) {
    return { data: [], total: 0, message: '${moduleName} module stub' };
  }
}
`;
}
