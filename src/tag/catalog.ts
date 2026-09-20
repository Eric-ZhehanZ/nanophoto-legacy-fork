export interface TagNames {
  tag: string
  nameEn: string
  nameZh: string
  aliases: string[]
}
export const normalizeTagName = (name: string) =>
  name.trim().toLocaleLowerCase().replace(/[\s_-]+/g, ' ');

export function resolveTagName(value: string, catalog: TagNames[]) {
  const key = normalizeTagName(value);
  return catalog.find(t => [t.tag, t.nameEn, t.nameZh, ...t.aliases]
    .some(name => name && normalizeTagName(name) === key));
}
