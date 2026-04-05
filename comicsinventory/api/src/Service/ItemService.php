<?php
namespace App\Service;

use App\Repository\ItemRepository;

class ItemService {
    public function __construct(private ItemRepository $repo) {}

    public function list(): array { return $this->repo->findAll(); }
    public function get(int $id): ?array { return $this->repo->find($id); }

    public function create(array $data): int {
        return $this->repo->create($this->sanitize($data));
    }

    public function update(int $id, array $data): bool {
        return $this->repo->update($id, $this->sanitize($data));
    }

    public function delete(int $id): bool { return $this->repo->delete($id); }

    private function sanitize(array $data): array {
        $allowed = ['tipo','nome','volume','editora','valor','autor','isbn','idioma','status'];
        $clean = [];
        foreach ($allowed as $key) { $clean[$key] = $data[$key] ?? null; }
        if ($clean['volume'] === '-' || $clean['volume'] === '') { $clean['volume'] = null; }
        if ($clean['valor'] !== null && $clean['valor'] !== '') { $clean['valor'] = (float)$clean['valor']; }
        $clean['tipo'] = $clean['tipo'] ?: 'hq';
        return $clean;
    }

    public function count(): int {
        return $this->repo->countAll();
    }

    public function listPaginated(int $page, int $perPage): array {
        return $this->repo->findPage($page, $perPage);
    }
}