import { keysToSnake } from './camel-to-snake';

describe('camel-to-snake', () => {
  it('should return the snake-case version of the camel-case keys of an object', () => {
    const user = {
      fullName: 'Petar Petrov',
      age: 20,
      workPhoneNumber: '1234',
    };

    expect(keysToSnake(user)).toEqual({
      full_name: 'Petar Petrov',
      age: 20,
      work_phone_number: '1234',
    });
  });

  it('should return the snake-case version of the camel-case keys of a nested object', () => {
    const user = {
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
    };

    expect(keysToSnake(user)).toEqual({
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
    });
  });
});
