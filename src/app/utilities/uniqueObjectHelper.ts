let id = 0;

/**
 * Gets an unique ID for an Object instantiation.
 * @param o the object to get an unique ID for.
 */
export const getID = (o) => {
  if (typeof o.__uniqueid === 'undefined') {
    Object.defineProperty(o, '__uniqueid', {
      value: ++id,
      enumerable: false,
      writable: false,
    });
  }

  return o.__uniqueid;
};
