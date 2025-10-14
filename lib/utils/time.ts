export const secondsToTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours > 0) {
    return `${hours} hours`
  } else {
    return `${minutes} minutes`
  }
}
