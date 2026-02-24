/** Core domain entity. */
export interface Hero {
  readonly id: string;
  readonly name: string;
}

/** DTO for hero creation — id is system-generated. */
export interface CreateHeroDto {
  readonly name: string;
}

/** DTO for partial hero updates. */
export interface UpdateHeroDto {
  readonly name?: string;
}