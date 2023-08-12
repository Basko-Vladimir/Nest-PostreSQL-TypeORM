import { IFileUploadingOutputModelDto } from '../../blogs/api/dto/uploaded-file-output-models.dto';
import { FileUploadingEntity } from '../entities/file-uploading.entity';
import { ImageType } from '../../common/enums';

export const mapFileUploadingEntityToFileUploadingOutputModel = (
  fileUploadings: FileUploadingEntity[],
): IFileUploadingOutputModelDto => {
  const wallpaper = fileUploadings.find(
    (item) => item.type === ImageType.WALLPAPER,
  );
  const mainFiles = fileUploadings.filter(
    (item) => item.type === ImageType.MAIN,
  );
  console.log(fileUploadings);
  return {
    wallpaper: {
      url: wallpaper.url,
      width: wallpaper.width,
      height: wallpaper.height,
      fileSize: wallpaper.size,
    },
    main: mainFiles.map((item) => ({
      url: item.url,
      width: item.width,
      height: item.height,
      fileSize: item.size,
    })),
  };
};
