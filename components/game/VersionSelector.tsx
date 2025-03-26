"use client";

import { Select, Field, createListCollection, Portal } from "@chakra-ui/react";
import { GameVersion } from "@prisma/client";

interface VersionSelectorProps {
  versions: GameVersion[];
  value: number | null;
  onValueChange: (versionId: number) => void;
}

export function VersionSelector({
  versions,
  value,
  onValueChange,
}: VersionSelectorProps) {
  // Create a collection from the versions data
  const versionCollection = createListCollection({
    items: versions.map((version) => ({
      label: version.name,
      value: version.id.toString(),
    })),
  });

  return (
    <Field.Root>
      <Select.Root
        collection={versionCollection}
        value={value ? [value.toString()] : undefined}
        onValueChange={(e) => onValueChange(parseInt(e.value[0]))}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Select version" />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content>
              {versionCollection.items.map((version) => (
                <Select.Item item={version} key={version.value}>
                  {version.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </Field.Root>
  );
}
