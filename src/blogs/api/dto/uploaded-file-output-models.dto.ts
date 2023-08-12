interface IUploadedImageOutputModelDto {
  url: string;
  width: number;
  height: number;
  fileSize: number;
}

export interface IFileUploadingOutputModelDto {
  wallpaper: IUploadedImageOutputModelDto;
  main: IUploadedImageOutputModelDto[];
}
