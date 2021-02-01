import { keysToCamel } from './snake-to-camel';

describe('snake-to-camel', () => {
  it('should return the camel-case version of the snake-case keys of a simple object', () => {
    const user = {
      full_name: 'Petar Petrov',
      age: 20,
      work_phone_number: '1234',
    };

    expect(keysToCamel(user)).toEqual({
      fullName: 'Petar Petrov',
      age: 20,
      workPhoneNumber: '1234',
    });
  });

  it('should return the camel-case version of the snake-case keys of a nested object', () => {
    const user = {
      full_name: 'Petar Petrov',
      age: 20,
      work_phone_number: '1234',
      hobbies: [
        {
          full_name: 'basketball',
          main_description: 'Exciting team-play centered sport for all ages',
        },
        {
          full_name: 'gaming',
          main_description: 'Activity for cooling off with some friends',
        },
      ],
    };

    expect(keysToCamel(user)).toEqual({
      fullName: 'Petar Petrov',
      age: 20,
      workPhoneNumber: '1234',
      hobbies: [
        {
          fullName: 'basketball',
          mainDescription: 'Exciting team-play centered sport for all ages',
        },
        {
          fullName: 'gaming',
          mainDescription: 'Activity for cooling off with some friends',
        },
      ],
    });
  });
});
