const BANNER = `
  ____                            _
 / ___| _ __ ___  ___ ___  _ __ | |__   _____  __
 \\___ \\| '_ \` _ \\ / _ \\ _ \\| '_ \\| '_ \\ / _ \\ \\/ /
  ___) | | | | | |  __/ | | | |_) | | | | (_) >  <
 |____/|_| |_| |_|\\___|_| |_|_.__/|_| |_|\\___/_/\\_\\
`.trim();

export function renderBanner(version: string): string {
  return `${BANNER}\n  v${version}`;
}
