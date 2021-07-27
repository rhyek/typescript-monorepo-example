import execa from 'execa';
import parseArgs from 'minimist';

export async function remoteImageExists(
  repository: string,
  image: string,
  tag: string,
) {
  return execa('docker', [
    'manifest',
    'inspect',
    `${repository}/${image}:${tag}`,
  ])
    .then(() => true)
    .catch(() => false);
}

if (require.main === module) {
  async function main() {
    const argv = parseArgs(process.argv.slice(2));
    const { repository, image, tag } = argv;
    return (await remoteImageExists(repository, image, tag)) ? 'true' : 'false';
  }
  main();

  process.on('unhandledRejection', (error) => {
    throw error;
  });
}
