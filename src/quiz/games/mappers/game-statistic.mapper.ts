import {
  ICommonStatisticOutputModel,
  IStatisticOutputModel,
} from '../api/dto/quiz-game-output-models.dto';

export interface IRawStatisticData {
  sumScore: string;
  avgScores: string;
  gamesCount: string;
  winsCount: string;
  lossesCount: string;
  drawsCount: string;
}

export interface ICommonRawStatisticData extends IRawStatisticData {
  playerId: string;
  login: string;
}

export const mapCurrentRawStatisticToStatisticOutputModel = (
  rawStatistic: IRawStatisticData,
): IStatisticOutputModel => {
  const {
    sumScore,
    avgScores,
    gamesCount,
    winsCount,
    lossesCount,
    drawsCount,
  } = rawStatistic;

  return {
    sumScore: Number(sumScore),
    avgScores: Math.round(Number(avgScores) * 100) / 100,
    gamesCount: Number(gamesCount),
    winsCount: Number(winsCount),
    lossesCount: Number(lossesCount),
    drawsCount: Number(drawsCount),
  };
};

export const mapCommonRawStatisticToStatisticOutputModel = (
  rawStatistic: ICommonRawStatisticData,
): ICommonStatisticOutputModel => {
  const {
    sumScore,
    avgScores,
    gamesCount,
    winsCount,
    lossesCount,
    drawsCount,
    playerId,
    login,
  } = rawStatistic;

  return {
    sumScore: Number(sumScore),
    avgScores: Math.round(Number(avgScores) * 100) / 100,
    gamesCount: Number(gamesCount),
    winsCount: Number(winsCount),
    lossesCount: Number(lossesCount),
    drawsCount: Number(drawsCount),
    player: {
      id: playerId,
      login,
    },
  };
};
