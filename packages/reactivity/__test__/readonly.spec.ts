import { readonly } from '../src';

describe('readonly', () => {
  it('happy path', () => {
    const raw = { foo: 1 };
    const data = readonly(raw) as { foo: number };

    data.foo = 2;

    expect(raw).not.toBe(data);
    expect(data.foo).toBe(1);
  });

  it('readonly warning', () => {
    console.warn = vitest.fn();

    const config = readonly({ host: 'google.com' }) as { host: string };

    config.host = 'bing.com';

    expect(console.warn).toBeCalled();
  });

  it('shallowReadonly', () => {
    console.warn = vitest.fn();
    const config = readonly({
      host: 'google.com',
      servers: {
        ip: '192.168.1.11',
      },
    }) as { host: string; servers: { ip: string } };
    config.servers.ip = '192.168.1.22';

    // 没有触发警告
    expect(console.warn).not.toBeCalled();
  });
});
