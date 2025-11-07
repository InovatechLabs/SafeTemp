import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getHistory6h, getHistory } from '../temperature';

describe('Serviço de temperatura (mock)', () => {
  const mock = new MockAdapter(axios);

  afterEach(() => {
    mock.reset();
  });

  it('deve retornar dados do histórico de 6h', async () => {
    const fakeResponse = [
      { timestamp: '2025-11-06T12:00:00Z', value: '24.5' },
      { timestamp: '2025-11-06T13:00:00Z', value: '25.2' },
    ];

    mock.onGet(/data\/history6h/).reply(200, fakeResponse);

    const result = await getHistory6h();
    expect(result).toEqual(fakeResponse);
  });

  it('deve lidar com erro na API', async () => {
    mock.onGet(/data\/history6h/).reply(500);

    await expect(getHistory6h()).rejects.toThrow();
  });

  it('deve aceitar parâmetro de data no getHistory', async () => {
    const fakeResponse = [{ timestamp: '2025-11-06T00:00:00Z', value: '22.0' }];
    mock.onGet(/data\/history/).reply((config) => {
      expect(config.params).toEqual({ date: '2025-11-05' });
      return [200, fakeResponse];
    });

    const result = await getHistory('2025-11-05');
    expect(result).toEqual(fakeResponse);
  });
});
