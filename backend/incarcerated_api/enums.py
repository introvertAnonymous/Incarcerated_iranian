from enum import Enum


class StatusEnum(Enum):
    FREE = "آزاد شد"
    IN_JAIL = "زندانی"
    UNKNOWN = "مفقود"
    DEAD = "در بازداشت کشته شد"
    DEATH_PENALTY = "حکم اعدام"
