/** Core domain entity. */
export interface Hero {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: Date;
}

/** DTO for hero creation — id and createdAt are system-generated. */
export interface CreateHeroDto {
  readonly name: string;
  readonly description?: string;
}

/** DTO for partial hero updates. */
export interface UpdateHeroDto {
  readonly name?: string;
  readonly description?: string;
}