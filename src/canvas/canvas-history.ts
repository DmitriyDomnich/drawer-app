export class CanvasHistory {
  private snapshots: ImageData[] = [];
  private currentSnapshotIndex = -1;

  private static instance: CanvasHistory;

  static getInstance() {
    if (!this.instance) {
      this.instance = new CanvasHistory();
    }
    return this.instance;
  }

  addSnapshot(imageData: ImageData) {
    if (this.currentSnapshotIndex !== this.snapshots.length - 1) {
      this.snapshots = this.snapshots.slice(0, this.currentSnapshotIndex + 1);
    }
    this.currentSnapshotIndex = this.snapshots.push(imageData) - 1;
  }
  getPreviousSnapshot() {
    if (this.currentSnapshotIndex) {
      return this.snapshots[--this.currentSnapshotIndex];
    }
  }
  getNextSnapshot() {
    if (this.currentSnapshotIndex < this.snapshots.length - 1)
      return this.snapshots[++this.currentSnapshotIndex];
  }
  reset() {
    this.snapshots = [];
    this.currentSnapshotIndex = -1;
  }
}
