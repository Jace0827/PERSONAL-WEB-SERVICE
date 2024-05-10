const pluralize = (count, noun) => `${count} ${noun}${count !== 1 ? 's' : ''} ago`;

const timePassed = (askDateTime) => {
  const now = new Date();
  const askedTime = new Date(askDateTime);
  const dateDiff = now - askedTime; // ms

  const secondsPassed = Math.floor(dateDiff / 1000);
  const minutesPassed = Math.floor(secondsPassed / 60);
  const hoursPassed = Math.floor(minutesPassed / 60);
  const daysPassed = Math.floor(hoursPassed / 24);

  if (daysPassed < 1) {
      if (hoursPassed < 1) {
          if (minutesPassed < 1) {
              return secondsPassed === 0 ? "just now" : pluralize(secondsPassed, "second");
          } else {
              return pluralize(minutesPassed, "minute");
          }
      } else {
          return pluralize(hoursPassed, "hour");
      }
  } else {
      const askDateLocal = askedTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const askTimeLocal = askedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

      // same year and diff year cases
      if (askedTime.getFullYear() === now.getFullYear()) {
          return `${askDateLocal} at ${askTimeLocal}`;
      } else {
          // include the year when it's a different year
          const askYear = askedTime.getFullYear();
          return `${askDateLocal}, ${askYear} at ${askTimeLocal}`;
      }
  }
};

export default timePassed;
