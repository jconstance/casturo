import itertools
import numpy as np
import json
import copy


def rotate_lines(card):
    new_lines = copy.deepcopy(card)

    def shift_point(point, amount):
        point[0] += amount
        point[1] += amount

    def flip(point):
        temp = point[1]
        point[1] = point[0]
        point[0] = temp

    def negate(point):
        point[0] *= -1

    for line in card:
        shift_point(line[0], -1.5)
        negate(line[0])
        flip(line[0])
        shift_point(line[0], 1.5)

        shift_point(line[1], -1.5)
        negate(line[1])
        flip(line[1])
        shift_point(line[1], 1.5)

    return new_lines


valid_points = [(0, 1), (0, 2), (1, 0), (2, 0), (3, 1), (3, 2), (1, 3), (2, 3)]

possible_lines = itertools.combinations(valid_points, 2)

good_cards = []
for card in itertools.combinations(possible_lines, 4):
    dup_set = set()
    good_card = True
    for line in card:
        if not dup_set.isdisjoint(line):
            good_card = False
            break
        else:
            dup_set = dup_set.union(line)
    if good_card:
        good_cards.append(card)
info = []
for good_card in good_cards:
    card = []
    for line in good_card:
        card.append({'from': line[0], 'to': line[1]})
    info.append(card)

good_cards = json.loads(json.dumps(good_cards))
print good_cards
print len(good_cards)
card_dict = {}
for card in good_cards:
    card_dict[str(card)] = json.dumps(card)
    card_dict[str(rotate_lines(card))] = json.dumps(card)
    card_dict[str(rotate_lines(rotate_lines(card)))] = json.dumps(card)
    card_dict[str(rotate_lines(rotate_lines(rotate_lines(card))))] = json.dumps(card)

print len(set(card_dict.values()))
