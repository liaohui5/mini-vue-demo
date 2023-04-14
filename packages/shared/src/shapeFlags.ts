export const enum ShapeFlags {
  ELEMENT            = 1,  // 0000 0001: 1
  STATEFUL_COMPONENT = 2,  // 0000 0010: 1 << 1
  TEXT_CHILDREN      = 4,  // 0000 0100: 1 << 2
  ARRAY_CHILDREN     = 8,  // 0000 1000: 1 << 3
  SLOT_CHILDREN      = 16  // 0001 0000: 1 << 4
}
