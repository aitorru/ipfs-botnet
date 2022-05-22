import axios from 'axios';

export default function pingL(url: string) {
  return setInterval(() => {
    try {
      axios.get(url);
    } catch (error) {
      console.error(error);
    }
  });
}