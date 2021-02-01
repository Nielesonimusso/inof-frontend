import { ModelStatusesPipe } from './model-statuses-pipe';

describe('ModelStatusesPipe', () => {
  it('transform method should transform the model status into the given format', () => {
    const pipe: any = new ModelStatusesPipe();
    const inputDate = [
      {
        created_on: '2020-05-30T13:53:16.826Z',
        model_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        model_name: 'string',
        ran_on: '2020-05-30T13:53:16.826Z',
        result: [{}],
        status: 'submitted',
      },
      {
        created_on: '2020-05-30T13:53:16.826Z',
        model_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        model_name: 'string',
        ran_on: '2020-05-30T13:53:16.826Z',
        result: [{}],
        status: 'success',
      },
      {
        created_on: '2020-05-30T13:53:16.826Z',
        model_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        model_name: 'string',
        ran_on: '2020-05-30T13:53:16.826Z',
        result: [{}],
        status: 'running',
      },
      {
        created_on: '2020-05-30T13:53:16.826Z',
        model_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        model_name: 'string',
        ran_on: '2020-05-30T13:53:16.826Z',
        result: [{}],
        status: 'failed',
      },
    ];
    const output = pipe.transform(inputDate);

    expect(output).toBe(getTestModelStatus());
  });
});

function getTestModelStatus() {
  return '2/4 models finished';
}
