const REGION_1_START = 0x00000004;

// Represents a saved executable program saved to the OS.
// Contains all data necessary to begin execution, except for argument data that is provided by the user.
//
// Conventions used for all Executables:
//   * Memory for the process will be laid out in the following pattern:
//     [ |0| |---1---| |---2---| |-------3-------| ]
//       0 -- The first 4 bytes are reserved for 0 values (so that 0 can be used as a null pointer value)
//       1 -- Data region; block of hard coded data that the executable byteCode will make reference to.
//            This section of memory _may_ change during execution, but will always be a static size
//            (visible as the "dataRegion.byteLength" property)
//            This region begins at address 0x00000004, and is as long as the dataRegion of this object.
//       2 -- Args region; block of data that is populated before executing the process. By convention,
//            this data is a sequence of \0-terminated strings (see below).
//            This region begins immediately after region 1, and is sized dynamically to fit provided args.
//       3 -- Running space; block of data that is used by the running process.
//            This region is uninitialized on start, and can be grown during process execution (up to limits
//            enforced by the process execution engine).
//            This region begins immediately after region 2, and continues to the end of the memory region.
//
//   * The entry point of the byteCode is an exported function named "main" with signature [*u8, i32] -> i32.
//       + The first argument is a pointer to the beginning of Region 3
//       + The second argument is an arbitrary integer, but by convention it specifies the number of string
//         arguments provided in Region 2
//       + The return value is also an arbitrary integer, the meaning of which is defined by the executable
export class Executable {
    constructor(byteCode, dataRegion) {
        this.byteCode = byteCode;
        this.dataRegion = dataRegion;
        this.dataRegionOffset = REGION_1_START;
        this.argRegionOffset = this.dataRegionOffset + dataRegion.byteLength;
    }
}
