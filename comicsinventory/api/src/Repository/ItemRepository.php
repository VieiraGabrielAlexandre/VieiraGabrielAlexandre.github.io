<?php
namespace App\Repository;

use PDO;

class ItemRepository {
    public function __construct(private PDO $db) {}

    public function findAll(): array {
        $stmt = $this->db->query("SELECT * FROM items ORDER BY nome");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function find(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM items WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare("
            INSERT INTO items (tipo,nome,volume,editora,valor,autor,isbn,idioma,status)
            VALUES (:tipo,:nome,:volume,:editora,:valor,:autor,:isbn,:idioma,:status)
        ");
        $stmt->execute($data);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $stmt = $this->db->prepare("
            UPDATE items
            SET tipo=:tipo,nome=:nome,volume=:volume,editora=:editora,valor=:valor,
                autor=:autor,isbn=:isbn,idioma=:idioma,status=:status
            WHERE id=:id
        ");
        return $stmt->execute(array_merge($data, ['id' => $id]));
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM items WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function countAll(): int {
        $stmt = $this->db->query("SELECT COUNT(*) AS c FROM items");
        return (int)$stmt->fetchColumn();
    }

    public function findPage(int $page, int $perPage): array {
        $offset = ($page - 1) * $perPage;
        $sql = "SELECT * FROM items ORDER BY id DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit',  $perPage, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset,  \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

}