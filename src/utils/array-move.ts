export function arrayMoveInside(
  arr: any[],
  fromIndex: number,
  toIndex: number
): void {
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}
