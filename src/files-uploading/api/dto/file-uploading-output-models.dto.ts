interface IUploadedImageOutputModelDto {
  url: string;
  width: number;
  height: number;
  fileSize: number;
}

export interface IBlogFileUploadingOutputModelDto {
  wallpaper: IUploadedImageOutputModelDto;
  main: IUploadedImageOutputModelDto[];
}

export interface IPostFileUploadingOutputModelDto {
  main: IUploadedImageOutputModelDto[];
}
