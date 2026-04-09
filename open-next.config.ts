import type { Config } from '@opennextjs/aws';

const config: Config = {
  default: {
    override: {
      wrapper: 'cloudflare',
      queue: 'cloudflare',
      tagCache: 'cloudflare',
      incrementalCache: 'cloudflare',
      kv: 'cloudflare_kv',
    },
  },
};

export default config;
