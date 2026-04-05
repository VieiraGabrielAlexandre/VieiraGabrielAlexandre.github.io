<?php
namespace App\Controller;

use App\Service\ItemService;
use App\Response;

class ItemController {
    public function __construct(private ItemService $service) {}

    public function index(): void
    {
        // Sanitiza query params
        $page     = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $perPage  = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 15;
        $perPage  = max(1, min(100, $perPage)); // limite de segurança

        $total    = $this->service->count();
        $items    = $this->service->listPaginated($page, $perPage);
        $pages    = (int)max(1, ceil($total / $perPage));

        // Headers de paginação (bons para front-ends e proxies)
        header('X-Total-Count: ' . $total);
        header('X-Total-Pages: ' . $pages);
        header('X-Per-Page: ' . $perPage);
        header('X-Current-Page: ' . $page);

        // Link header (RFC 5988) para next/prev
        $base = strtok($_SERVER['REQUEST_URI'], '?');
        $qs = function($p,$pp) {
            return http_build_query(['page'=>$p,'per_page'=>$pp]);
        };
        $links = [];
        if ($page > 1)            $links[] = "<{$base}?".$qs(1,$perPage).">; rel=\"first\"";
        if ($page > 1)            $links[] = "<{$base}?".$qs($page-1,$perPage).">; rel=\"prev\"";
        if ($page < $pages)       $links[] = "<{$base}?".$qs($page+1,$perPage).">; rel=\"next\"";
        if ($page !== $pages)     $links[] = "<{$base}?".$qs($pages,$perPage).">; rel=\"last\"";
        if ($links) header('Link: ' . implode(', ', $links));

        // Corpo com meta
        \App\Response::json([
            'data' => $items,
            'meta' => [
                'total'       => $total,
                'page'        => $page,
                'per_page'    => $perPage,
                'total_pages' => $pages,
            ],
        ]);
    }


    public function show(int $id): Response {
        $item = $this->service->get($id);
        if (!$item) return Response::json(['error'=>'Not found'], 404);
        Response::json($item);
    }

    public function store(array $data): Response {
        $id = $this->service->create($data);
        Response::json(['id'=>$id], 201);
    }

    public function update(int $id, array $data): Response {
        if (!$this->service->update($id, $data)) return Response::json(['error'=>'Not found or not updated'], 400);
        Response::json(['success'=>true]);
    }

    public function destroy(int $id): Response {
        if (!$this->service->delete($id)) return Response::json(['error'=>'Not found'], 404);
        Response::json([],204);
    }
}